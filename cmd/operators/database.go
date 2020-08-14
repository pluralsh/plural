package operators

import (
	"fmt"
	"os"
	"os/exec"
	"time"

	"github.com/michaeljguarino/forge/api"
	"github.com/michaeljguarino/forge/utils"
)

type postgres struct {
	Db  *api.Database
	Pwd string
}

type dbConnection interface {
	Connect(namespace string) error
}

func Database(namespace string, db *api.Database) error {
	kube, err := utils.Kubernetes()
	if err != nil {
		return err
	}

	secret, err := kube.Secret(namespace, db.Credentials.Secret)
	if err != nil {
		return err
	}

	val, ok := secret.Data[db.Credentials.Key]
	if !ok {
		return fmt.Errorf("Could not find credential key")
	}

	conn, err := buildConnection(string(val), db)
	if err != nil {
		return err
	}

	return conn.Connect(namespace)
}

func buildConnection(secret string, db *api.Database) (dbConnection, error) {
	switch db.Engine {
	case "POSTGRES":
		return &postgres{Pwd: secret, Db: db}, nil
	default:
		return nil, fmt.Errorf("Unsupported engine %s", db.Engine)
	}
}

func (pg *postgres) Connect(namespace string) error {
	fwd, err := portForward(namespace, pg.Db)
	if err != nil {
		return err
	}
	defer fwd.Process.Kill()

	utils.Highlight("Wait a bit while the port-forward boots up\n")
	time.Sleep(5 * time.Second)
	cmd := exec.Command("psql", "-U", pg.Db.Credentials.User, "-h", "127.0.0.1", pg.Db.Name)
	cmd.Env = os.Environ()
	cmd.Env = append(cmd.Env, fmt.Sprintf("PGPASSWORD=%s", pg.Pwd))
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin
	return cmd.Run()
}

func portForward(namespace string, db *api.Database) (cmd *exec.Cmd, err error) {
	cmd = exec.Command("kubectl", "port-forward", db.Target, fmt.Sprint(db.Port), "-n", namespace)
	err = cmd.Start()
	return
}

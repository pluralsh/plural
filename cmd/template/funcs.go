package template

import (
	"github.com/michaeljguarino/chartmart/api"
	"github.com/michaeljguarino/chartmart/config"
	"github.com/michaeljguarino/chartmart/crypto"
	"github.com/michaeljguarino/chartmart/utils"
	"strings"
	"os/exec"
	"path"
	"fmt"
	"os"
)

func repoRoot() (string, error) {
	cmd := exec.Command("git", "rev-parse", "--show-toplevel")
	res, err := cmd.CombinedOutput()
	return strings.TrimSpace(string(res)), err
}

func repoName() (string, error) {
	root, err := repoRoot()
	return path.Base(root), err
}

func repoUrl() (string, error) {
	cmd := exec.Command("git", "config", "--get", "remote.origin.url")
	res, err := cmd.CombinedOutput()
	return strings.TrimSpace(string(res)), err
}

func createWebhook(domain string) (api.Webhook, error) {
	client := api.NewClient()
	return client.CreateWebhook(path.Join("https://" + domain, "v1", "webhook"))
}

func dumpConfig() (string, error) {
	conf := config.Read()
	io, err := conf.Marshal()
	return string(io), err
}

func dumpAesKey() (string, error) {
	key, err := crypto.Materialize()
	if err != nil {
		return "", err
	}

	io, err := key.Marshal()
	return string(io), err
}

func readLine(prompt string) (string, error) {
	return utils.ReadLine(prompt + ": ")
}

func readLineDefault(prompt string, def string) (string, error) {
	result, err := utils.ReadLine(fmt.Sprintf("%s [%s]: ", prompt, def))
	if result == "" {
		return def, nil
	}

	return result, err
}

func homeDir(parts... string) (string, error) {
	home, err := os.UserHomeDir()
	return path.Join(home, path.Join(parts...)), err
}

func knownHosts() (string, error) {
	known_hosts, err := homeDir(".ssh", "known_hosts")
	if err != nil {
		return "", err
	}

	return utils.ReadFile(known_hosts)
}
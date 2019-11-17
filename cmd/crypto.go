package main

import (
	"github.com/michaeljguarino/chartmart/crypto"
	"github.com/urfave/cli"
	"io/ioutil"
	"os"
	"os/exec"
	"bytes"
	"path/filepath"
	"fmt"
	"strings"
)

var prefix = []byte("CHARTMART-ENCRYPTED")

func cryptoCommands() []cli.Command {
	return []cli.Command{
		{
			Name:   "encrypt",
			Usage:  "encrypts stdin and writes to stdout",
			Action: handleEncrypt,
		},
		{
			Name:   "decrypt",
			Usage:  "decrypts stdin and writes to stdout",
			Action: handleDecrypt,
		},
		{
			Name:   "unlock",
			Usage:  "auto-decrypts all affected files in the repo",
			Action: handleUnlock,
		},
		{
			Name:   "import",
			Usage:  "imports an aes key for chartmart to use",
			Action: importKey,
		},
		{
			Name:   "export",
			Usage:  "dumps the current aes key to stdout",
			Action: exportKey,
		},
	}
}

func handleEncrypt(c *cli.Context) error {
	data, err := ioutil.ReadAll(os.Stdin)
	if bytes.HasPrefix(data, prefix) {
		os.Stdout.Write(data)
		return nil
	}

	if err != nil {
		return err
	}
	key, err := crypto.Materialize()
	if err != nil {
		return err
	}
	result, err := key.Encrypt(data)
	if err != nil {
		return err
	}
	os.Stdout.Write(prefix)
	os.Stdout.Write(result)
	return nil
}

func handleDecrypt(c *cli.Context) error {
	data, err := ioutil.ReadAll(os.Stdin)
	if err != nil {
		return err
	}
	if !bytes.HasPrefix(data, prefix) {
		return fmt.Errorf("Not a valid chartmart encrypted file, %s", data)
	}
	key, err := crypto.Materialize()
	if err != nil {
		return err
	}
	result, err := key.Decrypt(data[len(prefix):])
	if err != nil {
		return err
	}
	os.Stdout.Write(result)
	return nil
}

func handleUnlock(c *cli.Context) error {
	cmd := exec.Command("git", "rev-parse", "--show-toplevel")
	res, err := cmd.CombinedOutput()
	if err != nil {
		return err
	}
	repoRoot := strings.TrimSpace(string(res))
	gitIndex, _ := filepath.Abs(filepath.Join(repoRoot, ".git", "index"))
	os.Remove(gitIndex)
	return gitCommand("checkout", "HEAD", "--", strings.TrimSpace(string(res))).Run()
}

func exportKey(c *cli.Context) error {
	key, err := crypto.Materialize()
	if err != nil {
		return err
	}
	io, err := key.Marshal()
	if err != nil {
		return err
	}
	os.Stdout.Write(io)
	return nil
}

func importKey(c *cli.Context) error {
	data, err := ioutil.ReadAll(os.Stdin)
	if err != nil {
		return err
	}
	key, err := crypto.Import(data)
	if err != nil {
		return err
	}
	return key.Flush()
}
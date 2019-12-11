package main

import (
	"github.com/michaeljguarino/chartmart/crypto"
	"github.com/michaeljguarino/chartmart/utils"
	"github.com/urfave/cli"
	"io/ioutil"
	"io"
	"os"
	"os/exec"
	"bytes"
	"path/filepath"
	"strings"
	"crypto/x509"
	"github.com/docker/libtrust"
	"encoding/pem"
	"fmt"
	crypt "crypto"
)

var prefix = []byte("CHARTMART-ENCRYPTED")


const gitattributes = `/**/helm/**/values.yaml filter=chartmart-crypt diff=chartmart-crypt
/**/manifest.yaml filter=chartmart-crypt diff=chartmart-crypt
`

const gitignore = `/**/.terraform
/**/.terraform*
/**/terraform.tfstate*
`

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
			Name:   "init",
			Usage:  "initializes git filters for you",
			Action: cryptoInit,
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
		{
			Name:   "fingerprint",
			Usage:  "generates the public key fingerprint for a cert",
			Action: fingerprint,
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
	var file io.Reader
	if c.Args().Present() {
		p, _ := filepath.Abs(c.Args().First())
		f, err := os.Open(p)
		defer f.Close()
		if err != nil {
			return err
		}
		file = f
	} else {
		file = os.Stdin
	}

	data, err := ioutil.ReadAll(file)
	if err != nil {
		return err
	}
	if !bytes.HasPrefix(data, prefix) {
		os.Stdout.Write(data)
		return nil
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

func cryptoInit(c *cli.Context) error {
	encryptConfig := [][]string{
		{"filter.chartmart-crypt.smudge", "chartmart crypto decrypt"},
		{"filter.chartmart-crypt.clean", "chartmart crypto encrypt"},
		{"filter.chartmart-crypt.required", "true"},
		{"diff.chartmart-crypt.textconv", "chartmart crypto decrypt"},
	}

	utils.Highlight("Creating git encryption filters\n\n")
	for _, conf := range encryptConfig {
		if err := gitConfig(conf[0], conf[1]); err != nil {
			panic(err)
		}
	}

	utils.WriteFileIfNotPresent(".gitattributes", gitattributes)
	utils.WriteFileIfNotPresent(".gitignore", gitignore)
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
	err = os.Remove(gitIndex)
	if err != nil {
		return err
	}

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

func fingerprint(c *cli.Context) error {
	rawCertBundle, err := ioutil.ReadAll(os.Stdin)
	if err != nil {
		return err
	}

	var rootCerts []*x509.Certificate
	pemBlock, rawCertBundle := pem.Decode(rawCertBundle)
	for pemBlock != nil {
		if pemBlock.Type == "CERTIFICATE" {
			cert, err := x509.ParseCertificate(pemBlock.Bytes)
			if err != nil {
				return fmt.Errorf("unable to parse token auth root certificate: %s", err)
			}

			rootCerts = append(rootCerts, cert)
		}

		pemBlock, rawCertBundle = pem.Decode(rawCertBundle)
	}

	if len(rootCerts) == 0 {
		return fmt.Errorf("token auth requires at least one token signing root certificate")
	}

	rootPool := x509.NewCertPool()
	trustedKeys := make(map[string]libtrust.PublicKey, len(rootCerts))
	for _, rootCert := range rootCerts {
		rootPool.AddCert(rootCert)
		pubKey, err := libtrust.FromCryptoPublicKey(crypt.PublicKey(rootCert.PublicKey))
		if err != nil {
			return fmt.Errorf("unable to get public key from token auth root certificate: %s", err)
		}
		trustedKeys[pubKey.KeyID()] = pubKey
		os.Stdout.Write([]byte(pubKey.KeyID()))
	}

	return nil
}
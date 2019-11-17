package crypto

import (
	"path"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
	"io/ioutil"
	"os"
	"github.com/michaeljguarino/chartmart/utils"
	"gopkg.in/yaml.v2"
)

type AESKey struct {
	Key string
}

func Materialize() (*AESKey, error) {
	p := getKeyPath()
	if utils.Exists(p) {
		contents, err := ioutil.ReadFile(p)
		if err != nil {
			return nil, err
		}
		conf := AESKey{}
		err = yaml.Unmarshal(contents, &conf)
		if err != nil {
			return nil, err
		}
		return &conf, nil
	}

	key := gen()
	if err := key.Flush(); err != nil {
		return nil, err
	}
	return key, nil
}

func getKeyPath() string {
	folder, _ := os.UserHomeDir()
	return path.Join(folder, ".chartmart", "key")
}

func gen() *AESKey {
	key := make([]byte, 32)
	if _, err := io.ReadFull(rand.Reader, key); err != nil {
		panic(err)
	}

	return &AESKey{
		base64.StdEncoding.EncodeToString(key),
	}
}

func Import(buf []byte) (*AESKey, error) {
	key := AESKey{}
	err := yaml.Unmarshal(buf, &key)
	return &key, err
}

func (k *AESKey) Marshal() ([]byte, error) {
	return yaml.Marshal(k)
}

func (k *AESKey) Flush() error {
	io, err := k.Marshal()
	if err != nil {
		return err
	}
	p := getKeyPath()
	return ioutil.WriteFile(p, io, 0644)
}

func (k *AESKey) Encrypt(text []byte) ([]byte, error) {
	key, err := base64.StdEncoding.DecodeString(k.Key)
	if err != nil {
		return nil, err
	}
	block, err := aes.NewCipher(key[:])
	if err != nil {
		return nil, err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonce := make([]byte, gcm.NonceSize())
	_, err = io.ReadFull(rand.Reader, nonce)
	if err != nil {
		return nil, err
	}

	return gcm.Seal(nonce, nonce, text, nil), nil
}

func (k *AESKey) Decrypt(text []byte) ([]byte, error) {
	key, err := base64.StdEncoding.DecodeString(k.Key)
	block, err := aes.NewCipher(key[:])
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	if len(text) < gcm.NonceSize() {
		return nil, errors.New("malformed text")
	}

	return gcm.Open(nil,
		text[:gcm.NonceSize()],
		text[gcm.NonceSize():],
		nil,
	)
}
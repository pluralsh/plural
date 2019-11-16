package utils

import (
	"os"
	"io/ioutil"
	"path/filepath"
)

func WriteFile(name string, content []byte) error {
	if err := os.MkdirAll(filepath.Dir(name), 0755); err != nil {
		return err
	}
	return ioutil.WriteFile(name, content, 0644)
}

func Exists(path string) bool {
	_, err := os.Stat(path)
	if os.IsNotExist(err) {
			return false
	}
	return true
}
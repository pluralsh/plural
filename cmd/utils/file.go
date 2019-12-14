package utils

import (
	"io/ioutil"
	"os"
	"path/filepath"
)

func WriteFile(name string, content []byte) error {
	if err := os.MkdirAll(filepath.Dir(name), 0755); err != nil {
		return err
	}
	return ioutil.WriteFile(name, content, 0644)
}

func WriteFileIfNotPresent(path, contents string) {
	fullpath, _ := filepath.Abs(path)
	if Exists(fullpath) {
		return
	}
	if err := ioutil.WriteFile(fullpath, []byte(contents), 0644); err != nil {
		panic(err)
	}
}

func ReadFile(name string) (string, error) {
	content, err := ioutil.ReadFile(name)
	return string(content), err
}

func Exists(path string) bool {
	_, err := os.Stat(path)
	if os.IsNotExist(err) {
		return false
	}
	return true
}

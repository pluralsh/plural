package config

import (
	"fmt"
	"gopkg.in/oleiade/reflections.v1"
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"os"
	"path"
	"strings"
)

type Config struct {
	Token string `yaml:"token"`
}

func configFile() string {
	folder, _ := os.UserHomeDir()
	return path.Join(folder, ".chartmart", "config.yml")
}

func Read() Config {
	contents, err := ioutil.ReadFile(configFile())
	conf := Config{}
	if err != nil {
		return conf
	}

	err = yaml.Unmarshal(contents, &conf)
	if err != nil {
		fmt.Printf("wtf")
	}

	return conf
}

func Amend(key string, value string) error {
	key = strings.Title(key)
	conf := Read()
	reflections.SetField(&conf, key, value)
	return flush(&conf)
}

func flush(c *Config) error {
	io, err := yaml.Marshal(&c)
	if err != nil {
		return err
	}

	folder, _ := os.UserHomeDir()
	if err := os.MkdirAll(path.Join(folder, ".chartmart"), os.ModePerm); err != nil {
		return err
	}

	return ioutil.WriteFile(configFile(), io, 0644)
}

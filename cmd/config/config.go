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
	Email string
	Token string `yaml:"token"`
}

func configFile() string {
	folder, _ := os.UserHomeDir()
	return path.Join(folder, ".forge", "config.yml")
}

func Read() Config {
	return Import(configFile())
}

func Import(file string) Config {
	contents, err := ioutil.ReadFile(file)
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
	return Flush(&conf)
}

func (conf *Config) Marshal() ([]byte, error) {
	return yaml.Marshal(conf)
}

func Flush(c *Config) error {
	io, err := c.Marshal()
	if err != nil {
		return err
	}

	folder, _ := os.UserHomeDir()
	if err := os.MkdirAll(path.Join(folder, ".forge"), os.ModePerm); err != nil {
		return err
	}

	return ioutil.WriteFile(configFile(), io, 0644)
}

package forgefile

import (
	"fmt"
	"io/ioutil"
	"path/filepath"

	"gopkg.in/yaml.v2"
)

type Lockfile struct {
	Artifact    map[string]string
	Terraform   map[string]string
	Helm        map[string]string
	Recipe      map[string]string
	Integration map[string]string
	Shell       map[string]string
	Database    map[string]string
	Crd         map[string]string
}

func lock() *Lockfile {
	return &Lockfile{
		Artifact:    map[string]string{},
		Terraform:   map[string]string{},
		Helm:        map[string]string{},
		Recipe:      map[string]string{},
		Integration: map[string]string{},
		Shell:       map[string]string{},
		Database:    map[string]string{},
		Crd:         map[string]string{},
	}
}

func Lock(path string) *Lockfile {
	lockfile := lockPath(path)
	fmt.Println(lockfile)
	lock := lock()
	content, err := ioutil.ReadFile(lockfile)
	if err != nil {
		return lock
	}

	yaml.Unmarshal(content, lock)
	return lock
}

func lockPath(path string) string {
	return filepath.Join(filepath.Dir(path), "forge.lock")
}

func (lock *Lockfile) Flush(path string) error {
	io, err := yaml.Marshal(lock)
	if err != nil {
		return err
	}
	return ioutil.WriteFile(lockPath(path), io, 0644)
}

func (lock *Lockfile) getSha(name ComponentName, key string) string {
	switch name {
	case HELM:
		sha, _ := lock.Helm[key]
		return sha
	case TERRAFORM:
		sha, _ := lock.Terraform[key]
		return sha
	case RECIPE:
		sha, _ := lock.Recipe[key]
		return sha
	case ARTIFACT:
		sha, _ := lock.Artifact[key]
		return sha
	case SHELL:
		sha, _ := lock.Shell[key]
		return sha
	case DATABASE:
		sha, _ := lock.Database[key]
		return sha
	case INTEGRATION:
		sha, _ := lock.Integration[key]
		return sha
	case CRD:
		sha, _ := lock.Crd[key]
		return sha
	default:
		return ""
	}
}

func (lock *Lockfile) addSha(name ComponentName, key string, sha string) {
	switch name {
	case HELM:
		lock.Helm[key] = sha
		return
	case TERRAFORM:
		lock.Terraform[key] = sha
	case RECIPE:
		lock.Recipe[key] = sha
	case ARTIFACT:
		lock.Artifact[key] = sha
	case SHELL:
		lock.Shell[key] = sha
	case DATABASE:
		lock.Database[key] = sha
	case INTEGRATION:
		lock.Integration[key] = sha
	case CRD:
		lock.Crd[key] = sha
	default:
		return
	}
}

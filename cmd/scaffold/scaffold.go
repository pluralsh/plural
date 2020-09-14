package scaffold

import (
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/hashicorp/hcl"
	"github.com/rodaine/hclencoder"

	"github.com/michaeljguarino/forge/executor"
	"github.com/michaeljguarino/forge/utils"
	"github.com/michaeljguarino/forge/wkspace"
)

type Scaffold struct {
	Name string `hcl:",key"`
	Path string `hcl:"path"`
	Type string `hcl:"type"`
	Root string `hcle:"omit"`

	Preflight []*executor.Step `hcl:"preflight"`
}

type Metadata struct {
	Name string `hcl:"name"`
}

type Build struct {
	Metadata  *Metadata   `hcl:"metadata"`
	Scaffolds []*Scaffold `hcl:"scaffold"`
}

const (
	TF   = "terraform"
	HELM = "helm"
	CRD  = "crd"
)

func Scaffolds(wk *wkspace.Workspace) (*Build, error) {
	repoRoot, err := utils.RepoRoot()
	if err != nil {
		return &Build{}, err
	}

	name := wk.Installation.Repository.Name
	wkspaceRoot := filepath.Join(repoRoot, name)

	build, err := Read(wkspaceRoot)
	def := Default(name)
	if err != nil {
		return def, nil
	}

	return merge(build, def), nil
}

func Read(path string) (*Build, error) {
	fullpath := filepath.Join(path, "build.hcl")
	contents, err := ioutil.ReadFile(fullpath)
	build := Build{}
	if err != nil {
		return &build, err
	}

	err = hcl.Decode(&build, string(contents))
	if err != nil {
		return &build, err
	}

	return &build, nil
}

func Default(name string) (b *Build) {
	return &Build{
		Metadata: &Metadata{Name: name},
		Scaffolds: []*Scaffold{
			{
				Name: "terraform",
				Path: "terraform",
				Type: TF,
			},
			{
				Name: "crds",
				Type: CRD,
				Path: "crds",
			},
			{
				Name: "helm",
				Type: HELM,
				Path: filepath.Join("helm", name),
				Preflight: []*executor.Step{
					{
						Name:    "add-repo",
						Command: "helm",
						Args:    []string{"repo", "add", name, repoUrl(name)},
						Target:  "requirements.yaml",
						Sha:     "",
					},
					{
						Name:    "update-deps",
						Command: "helm",
						Args:    []string{"dependency", "update"},
						Target:  "requirements.yaml",
						Sha:     "",
					},
				},
			},
		},
	}
}

func merge(build *Build, base *Build) *Build {
	byName := make(map[string]*Scaffold)

	for _, scaffold := range build.Scaffolds {
		byName[scaffold.Name] = scaffold
	}
	for _, scaffold := range base.Scaffolds {
		if prev, ok := byName[scaffold.Name]; ok {
			mergePreflights(scaffold, prev)
		}
		byName[scaffold.Name] = scaffold
	}

	graph := utils.Graph(len(byName))

	for key := range byName {
		graph.AddNode(key)
	}

	for i := 0; i < len(build.Scaffolds)-1; i++ {
		graph.AddEdge(build.Scaffolds[i].Name, build.Scaffolds[i+1].Name)
	}

	for i := 0; i < len(base.Scaffolds)-1; i++ {
		graph.AddEdge(build.Scaffolds[i].Name, build.Scaffolds[i+1].Name)
	}

	sorted, ok := graph.Topsort()
	if !ok {
		panic("scaffold cycle created")
	}

	scaffolds := []*Scaffold{}
	for _, name := range sorted {
		scaffolds = append(scaffolds, byName[name])
	}
	build.Scaffolds = scaffolds

	return build
}

func mergePreflights(new, old *Scaffold) {
	byName := make(map[string]*executor.Step)
	for _, preflight := range old.Preflight {
		byName[preflight.Name] = preflight
	}

	for _, preflight := range new.Preflight {
		if prev, ok := byName[preflight.Name]; ok {
			preflight.Sha = prev.Sha
		}
	}
}

func (b *Build) Flush(root string) error {
	io, err := hclencoder.Encode(&b)
	if err != nil {
		return err
	}

	path, _ := filepath.Abs(filepath.Join(root, b.Metadata.Name, "build.hcl"))
	return ioutil.WriteFile(path, io, 0644)
}

func (s *Scaffold) Execute(wk *wkspace.Workspace) error {
	os.Setenv("HELM_REPO_ACCESS_TOKEN", wk.Config.Token)
	err := s.executeType(wk)
	if err != nil {
		return err
	}

	ignore := []string{}
	for _, preflight := range s.Preflight {
		sha, err := preflight.Execute(s.Root, ignore)
		if err != nil {
			return err
		}
		preflight.Sha = sha
	}

	return nil
}

func (s *Scaffold) executeType(wk *wkspace.Workspace) error {
	switch s.Type {
	case TF:
		return s.handleTerraform(wk)
	case HELM:
		return s.handleHelm(wk)
	case CRD:
		return s.buildCrds(wk)
	default:
		return nil
	}
}

func (b *Build) Execute(wk *wkspace.Workspace) error {
	root, err := utils.RepoRoot()
	if err != nil {
		return err
	}

	for _, s := range b.Scaffolds {
		path := filepath.Join(root, b.Metadata.Name, s.Path)
		if err := os.MkdirAll(path, os.ModePerm); err != nil {
			b.Flush(root)
			return err
		}
		s.Root = path
		if err := s.Execute(wk); err != nil {
			b.Flush(root)
			return err
		}
	}

	return b.Flush(root)
}

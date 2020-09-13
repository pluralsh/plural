package scaffold

import (
	"io/ioutil"
	"net/http"
	"path/filepath"

	"github.com/michaeljguarino/forge/api"
	"github.com/michaeljguarino/forge/wkspace"
)

func (s *Scaffold) buildCrds(wk *wkspace.Workspace) error {
	for _, chartInst := range wk.Charts {
		for _, crd := range chartInst.Version.Crds {
			if err := writeCrd(s.Root, &crd); err != nil {
				return err
			}
		}
	}

	return nil
}

func writeCrd(path string, crd *api.Crd) error {
	resp, err := http.Get(crd.Blob)
	if err != nil {
		return err
	}

	contents, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	return ioutil.WriteFile(filepath.Join(path, crd.Name), contents, 0644)
}

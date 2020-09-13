package scaffold

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"path/filepath"

	"github.com/michaeljguarino/forge/api"
	"github.com/michaeljguarino/forge/utils"
	"github.com/michaeljguarino/forge/wkspace"
)

func (s *Scaffold) buildCrds(wk *wkspace.Workspace) error {
	utils.Highlight("syncing crds")
	for _, chartInst := range wk.Charts {
		for _, crd := range chartInst.Version.Crds {
			utils.Highlight(".")
			if err := writeCrd(s.Root, &crd); err != nil {
				fmt.Print("\n")
				return err
			}
		}
	}

	utils.Success("\u2713\n")
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

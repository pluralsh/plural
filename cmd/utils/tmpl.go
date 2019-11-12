package utils

import (
	"io"
	"text/template"
	"github.com/Masterminds/sprig"
)

func RenderTemplate(wr io.Writer, tmplate string, values map[string]interface{}) error {
	tmp, err := template.New("gotpl").Funcs(sprig.TxtFuncMap()).Parse(tmplate)
	if err != nil {
		return err
	}
	return tmp.Execute(wr, map[string]interface{}{"Values": values})
}
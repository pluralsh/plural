package utils

import (
	"io"
	"text/template"
	"github.com/Masterminds/sprig"
)

func MakeTemplate(tmplate string) (*template.Template, error) {
	return template.New("gotpl").Funcs(sprig.TxtFuncMap()).Parse(tmplate)
}

func RenderTemplate(wr io.Writer, tmplate string, ctx map[string]interface{}) error {
	tmpl, err := MakeTemplate(tmplate)
	if err != nil {
		return err
	}
	return tmpl.Execute(wr, map[string]interface{}{"Values": ctx})
}
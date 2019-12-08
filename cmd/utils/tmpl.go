package utils

import (
	"github.com/Masterminds/sprig"
	"io"
	"text/template"
)

func MakeTemplate(tmplate string) (*template.Template, error) {
	funcs := sprig.TxtFuncMap()
	funcs["genAESKey"] = GenAESKey
	return template.New("gotpl").Funcs(funcs).Parse(tmplate)
}

func RenderTemplate(wr io.Writer, tmplate string, ctx map[string]interface{}) error {
	tmpl, err := MakeTemplate(tmplate)
	if err != nil {
		return err
	}
	return tmpl.Execute(wr, map[string]interface{}{"Values": ctx})
}

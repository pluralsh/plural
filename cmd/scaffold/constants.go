package scaffold

import (
	"path/filepath"
)

const (
	defaultNotes = `Placeholder for now`
	sep = string(filepath.Separator)
	defaultChartfile = `apiVersion: v1
name: %s
description: A Helm chart for Kubernetes
version: 0.1.0
appVersion: 1.16.0
`
	defaultIgnore = `# Patterns to ignore when building packages.
# This supports shell glob matching, relative path matching, and
# negation (prefixed with !). Only one pattern per line.
.DS_Store
# Common VCS dirs
.git/
.gitignore
.bzr/
.bzrignore
.hg/
.hgignore
.svn/
# Common backup files
*.swp
*.bak
*.tmp
*~
# Various IDEs
.project
.idea/
*.tmproj
.vscode/
`
	// ChartfileName is the default Chart file name.
	ChartfileName = "Chart.yaml"
	// ValuesfileName is the default values file name.
	TemplatesDir = "templates"
	// ChartsDir is the relative directory name for charts dependencies.
	ChartsDir = "charts"
	// IgnorefileName is the name of the Helm ignore file.
	IgnorefileName = ".helmignore"
	// NotesName is the name of the example NOTES.txt file.
	NotesName = TemplatesDir + sep + "NOTES.txt"
)

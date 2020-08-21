package executor

import (
	"io"
	"strings"
)

type OutputWriter struct {
	delegate    io.WriteCloser
	useDelegate bool
	lines       []string
}

func (out *OutputWriter) Write(line []byte) (int, error) {
	if out.useDelegate {
		return out.delegate.Write(line)
	}

	out.lines = append(out.lines, string(line))
	out.delegate.Write([]byte("."))
	return len(line), nil
}

func (out *OutputWriter) Close() error {
	return out.delegate.Close()
}

func (out *OutputWriter) Format() string {
	return strings.Join(out.lines, "")
}

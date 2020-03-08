package executor

import (
	"io"
	"strings"
)

type outputWriter struct {
	delegate    io.WriteCloser
	useDelegate bool
	lines       []string
}

func (out *outputWriter) Write(line []byte) (int, error) {
	if out.useDelegate {
		return out.delegate.Write(line)
	}

	out.lines = append(out.lines, string(line))
	out.delegate.Write([]byte("."))
	return len(line), nil
}

func (out *outputWriter) Close() error {
	return out.delegate.Close()
}

func (out *outputWriter) Format() string {
	return strings.Join(out.lines, "")
}

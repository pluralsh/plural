// Regular Expression for URL validation
//
// Author: Diego Perini
// Created: 2010/12/05
// Updated: 2018/09/12
// License: MIT
//
// Copyright (c) 2010-2018 Diego Perini (http://www.iport.it)
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following
// conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.
const urlRegex = new RegExp('^'
    // protocol identifier (optional)
    // short syntax // still required
    + '(?:(?:(?:https?|ftp):)?\\/\\/)'
    // user:pass BasicAuth (optional)
    + '(?:\\S+(?::\\S*)?@)?'
    + '(?:'
    // IP address exclusion
    // private & local networks
    + '(?!(?:10|127)(?:\\.\\d{1,3}){3})'
    + '(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})'
    + '(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})'
    // IP address dotted notation octets
    // excludes loopback network 0.0.0.0
    // excludes reserved space >= 224.0.0.0
    // excludes network & broadcast addresses
    // (first & last IP address of each class)
    + '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])'
    + '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}'
    + '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))'
    + '|'
    // host & domain names, may end with dot
    // can be replaced by a shortest alternative
    // (?![-_])(?:[-\\w\\u00a1-\\uffff]{0,63}[^-_]\\.)+
    + '(?:'
    + '(?:'
    + '[a-z0-9\\u00a1-\\uffff]'
    + '[a-z0-9\\u00a1-\\uffff_-]{0,62}'
    + ')?'
    + '[a-z0-9\\u00a1-\\uffff]\\.'
    + ')+'
    // TLD identifier name, may end with dot
    + '(?:[a-z\\u00a1-\\uffff]{2,}\\.?)'
    + ')'
    // port number (optional)
    + '(?::\\d{2,5})?'
    // resource path (optional)
    + '(?:[/?#]\\S*)?'
    + '$',
'i')

export function isValidURL(url: string): boolean {
  return urlRegex.test(url)
}

// In most of the cases if URL fails validity check it is missing protocol.
// This method adds protocol shorthand when it is missing.
// It doesn't support local paths.
export function ensureURLValidity(url: string | null | undefined): string | null | undefined {
  if (!url) return url

  if (isValidURL(url)) return url

  return `//${url}`
}

# URL Sanitization Test

This markdown content tests the URL sanitization functionality in the Markdown component.

## Safe URLs (should work normally):

1. [Regular HTTPS link](https://www.example.com)
2. [HTTP link](http://www.example.com)
3. [Relative link](/some/path)
4. [Hash link](#section)
5. [Email link](mailto:test@example.com)
6. [Phone link](tel:+1234567890)
7. [FTP link](ftp://files.example.com)

## Potentially dangerous URLs (should be sanitized):

1. [JavaScript URL](javascript:alert('XSS'))
2. [Data URL](data:text/html,<script>alert('XSS')</script>)
3. [VBScript URL](vbscript:msgbox('XSS'))
4. [File URL](file:///etc/passwd)

## Edge cases:

1. [Empty href]()
2. [Invalid URL](not-a-valid-url)
3. [Malformed protocol](ht tp://example.com)

The sanitization should:
- Allow safe protocols: http, https, mailto, tel, ftp
- Allow relative URLs starting with /, #, or ?
- Block dangerous protocols like javascript:, data:, vbscript:, file:
- Convert blocked URLs to "#" for safety

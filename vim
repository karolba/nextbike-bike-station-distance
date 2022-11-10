#!/bin/sh
exec vim +"map <CR> :w<CR>:!node process.js<CR>" "$@"

#!/bin/bash
cd /home/z/my-project
exec NODE_OPTIONS='--max-old-space-size=4096' node_modules/.bin/next dev -p 3000 >> /home/z/my-project/dev.log 2>&1

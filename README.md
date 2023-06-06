# Reyna

Build frontend applications with full end to end type safety

## Structure

- **packages/babel:** contains babel plugin for RPC transformations
- **packages/vite:** contains vite plugin which uses reyna babel plugin to support RPC in vite
- **packages/express:** contains express middleware which adds `/reyna` endpoint
- **packages/cli:** contains the Reyna RPC framework

# Step 1: builder
FROM thanhnguyen/node-stack:8-builder AS builder

# Step 2: runtime
FROM thanhnguyen/node-stack:8-runtime


"run(()"
"$effect(()"


#find ファイル名 | xargs sed -i "s/run(()/$effect(()/g"
find src/ -type f -name "*.svelte" | xargs sed -i "s/run(()/\$effect(()/g"




docker rm gaem_js_container
docker run -it --name gaem_js_container -p 8080:3000 gaem_js_img
#docker run -it --name gaem_js_container --volume vol-ubuntu:/var/log gaem_js_img
#docker run -itd --rm --name cont_expose -p 8080:80 img_expose
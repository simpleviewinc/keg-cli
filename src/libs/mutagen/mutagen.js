
// Example mutagen create command
  // mutagen create \
  //     --label=mage2click-sync=html \
  //     --default-file-mode=0644 \
  //     --default-directory-mode=0755 \
  //     --default-owner-beta=app \
  //     --default-group-beta=app \
  //     --sync-mode=two-way-resolved \
  //     --ignore=/.idea \
  //     --ignore=/bin \
  //     --ignore=/generated \
  //     --ignore=/pub/media/catalog/product \
  //     --ignore=/pub/static \
  //     --ignore=/var \
  //     --ignore=/vendor \
  //     --ignore=node_modules \
  //     --ignore-vcs \
  //     ${CONTAINER_SRC_SYNC_DIR} docker://$(docker-compose ps -q phpfpm|awk '{print $1}')/var/www/html

class Mutagen {

  constructor(options){
    
  }
  
  create = () => {
    
  }

}
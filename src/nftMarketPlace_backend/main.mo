import Principal "mo:base/Principal";
import NFTActorClass  "../nft/nft";


actor nftmarketplaceD{
  public shared(msg) func mint(imgData:[Nat8], name:Text) :async Principal{
    let owner : Principal = msg.caller;

    let newNFT = await NFTActorClass.NFT(name,owner,imgData);
    let newNFT.canister_id;
  }
}
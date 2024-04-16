import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import NFTActorClass "../NFT/nft";
import Cycles "mo:base/ExperimentalCycles";
import HashMap "mo:base/HashMap";
import List "mo:base/List";
import Nat "mo:base/Nat";
import Text "mo:base/Text";




actor nftmarketplace{

  private type Listing={
    Owner: Principal;
    Price: Nat;
  };

  var mapOfNFTs = HashMap.HashMap<Principal, NFTActorClass.NFT>(1, Principal.equal, Principal.hash);
  var mapOfOwners = HashMap.HashMap<Principal, List.List<Principal>>(1, Principal.equal, Principal.hash);
  var mapOfListings = HashMap.HashMap<Principal, Listing>(1, Principal.equal, Principal.hash);


  public shared(msg) func mint(imgData:[Nat8], name:Text) :async Principal{
    let owner : Principal = msg.caller;

    Debug.print(debug_show(Cycles.balance()));
    Cycles.add<system>(100_500_000_000);


    let newNFT = await NFTActorClass.NFT(name,owner,imgData);
    Debug.print(debug_show(Cycles.balance()));

    let newNFTPrincipal= await newNFT.getCanisterId();
    mapOfNFTs.put(newNFTPrincipal, newNFT);
    addToOwnershipMap(owner, newNFTPrincipal);
    return newNFTPrincipal;
  };

  private func addToOwnershipMap(owner: Principal, nftId: Principal){
    var ownedNFTs : List.List<Principal> = switch(mapOfOwners.get(owner)){
      case null List.nil<Principal>();
      case (?result) result;
    };
    ownedNFTs := List.push(nftId, ownedNFTs);
    mapOfOwners.put(owner, ownedNFTs);
  };
  public query func getOwnedNFTs(user :Principal) : async [Principal]{
    var userNFTs :  List.List<Principal> = switch(mapOfOwners.get(user)){
      case null List.nil<Principal>();
      case (?result) result;
      };
    return List.toArray(userNFTs);
  };


  public shared(msg) func listItem(id: Principal, price: Nat) : async Text {
      var item : NFTActorClass.NFT = switch (mapOfNFTs.get(id)) {
        case null return "NFT does not exist.";
        case (?result) result;
      };

      let owner = await item.getOwner();
      if (Principal.equal(owner, msg.caller)) {
        
        let newListing : Listing = {
          itemOwner = owner;
          itemPrice = price;

        };
        mapOfListings.put(id, newListing);
        return "Success";
      } else {
        return "You don't own the NFT."
      }
    };

    public query func getNftMarketPlaceCanisterID() : async Principal {
      return Principal.fromActor(nftmarketplace);
    }
}
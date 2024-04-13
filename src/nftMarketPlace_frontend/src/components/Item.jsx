import React, { useEffect, useState } from "react";
import logo from "../../public/logo.png";
import {Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { Principal } from "@dfinity/principal";


function Item(props) {
const [name, setName] = useState();
const [owner, setOwner] =useState()
const [image, setImage] = useState();

  const id  = Principal.fromText(props.id);
  const localhost="http://localhost:8080"

  const agent = new HttpAgent({host:localhost})
  
  async function loadNFT(){
    const NFTACTOR = await Actor.createActor(idlFactory,{
      agent,
      canisterId:id,
    })
    const name = await NFTACTOR.getName();
    setName(name);

    const owner = await NFTACTOR.getOwner();
    setOwner(owner.toText());

    const imageDate = await NFTACTOR.getAsset();
    const imageContent = new Uint8Array(imageDate);
    const image = URL.createObjectURL(new Blob([imageContent.buffer], {type: "image/png"}));
    setImage(image);

  }

  useEffect(() => {
    loadNFT();
  }, []);

  return (
    <div className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
        />
        <div className="disCardContent-root">
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}
            <span className="purple-text"></span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Item;

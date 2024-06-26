import React, { useEffect, useState } from "react";
import logo from "/logo.png";
import { BrowserRouter, Link , Routes, Route} from "react-router-dom";
import homeImage from "/home-img.png";
import Gallery from "./Gallery";
import Minter from "./Minter";
import {nftMarketPlace_backend} from "../../../declarations/nftMarketPlace_backend";
import CURRENT_USER_ID from "../main";


function Header() {
  const [userOwnerGallery, setUserOwnerGallery] = useState()
  const [listingGalley, setListingGalley] = useState();

  async function getNFTs(){
    const userNFTIds = await nftMarketPlace_backend.getOwnedNFTs(CURRENT_USER_ID);
    console.log(userNFTIds);
    setUserOwnerGallery(<Gallery title="My NFTs" ids={userNFTIds} role="collection"/>)

    const listedNFTIds = await nftMarketPlace_backend.getListedNFTs();
    setListingGalley(<Gallery title="Discover" ids={listedNFTIds} role="discover"/>)
  }
  useEffect(()=>{
    getNFTs();
  },[])
  return (
    <BrowserRouter forceRefresh={true}>
      <div className="app-root-1">
        <header className="Paper-root AppBar-root AppBar-positionStatic AppBar-colorPrimary Paper-elevation4">
          <div className="Toolbar-root Toolbar-regular header-appBar-13 Toolbar-gutters">
            <div className="header-left-4"></div>
            <img className="header-logo-11" src={logo} />
            <div className="header-vertical-9"></div>
            <Link to ="/">
              <h5 className="Typography-root header-logo-text">NFT MARKETPLACE</h5>
            </Link>
            <div className="header-empty-6"></div>
            <div className="header-space-8"></div>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/discover">
                Discover
              </Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/minter">
                Minter
              </Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to = "/collection">
                My NFTs
              </Link>
            </button>
          </div>
        </header>
      </div>
      <Routes>
        <Route exact path="/">
        <img className="bottom-space" src={homeImage} />
        </Route>
        <Route path="/discover">
          {listingGalley}
        </Route>
        <Route path="/minter">
          <Minter />
        </Route>
        <Route path="/collection">
          {userOwnerGallery}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default Header;

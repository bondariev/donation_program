<script lang="ts">
  import { BN,Idl,Program,Provider,web3 } from "@project-serum/anchor";
  import Wallet from "@project-serum/sol-wallet-adapter";
  import { Connection,PublicKey } from "@solana/web3.js";
  import { Buffer } from "buffer";
  import { onMount } from "svelte";
  import * as idl from "./idl/donation_program.json";
  import type { DonationProgram } from "./types/donation_program";
  const { SystemProgram, Keypair } = web3;

  // ======== APPLICATION STATE ========
  let DONATOR_SEED = "donator_8";
  let PROGRAM_SEED = "donate_account_20";
  let BASE_ACCOUNT;

  let account = "";


  $: account && console.log(`connected to sollet wallet: ${account}`);

  let solletWallet = new Wallet("https://www.sollet.io", "testnet")

  // ======== PAGE LOAD CHECKS ========

  const onLoad = async () => {
    solletWallet.on("connect", () => (account = solletWallet.publicKey.toString()));
    solletWallet.on("disconnect", () => (account = "",console.log("sollet disconnected")));
  };

  // life cycle hook for when the component is mounted
  onMount(() => {
    // run the onLoad function when the page completes loading
    window.addEventListener("load", onLoad);

    // return a cleanup function to remove the event listener to avoid memory leaks when the page unloads
    return () => window.removeEventListener("load", onLoad);
  });

  // ======== CONNECT WALLET ========
  const handleConnectWallet = async () => {
    //const resp = await wallet.connect();
    await solletWallet.connect()
  };

  const isConnected = async () => {
    //const resp = await wallet.connect();

    console.log(solletWallet.connected);
     return solletWallet.connected;
  };



  // ======== CONNECT TO NETWORK ========

  // get program id from IDL, the metadata is only available after a deployment
  //const programID = new PublicKey(idl.metadata.address);
  const programID = new PublicKey("9bKQJH1L9zmSH5Ds9ePHu85aKHCgsNzVGYoub9ihJik1");

  // we are using local network endpoint for now
  const network = "http://127.0.0.1:8899";

  const connection = new Connection(network, "confirmed");

  // create a network and wallet context provider
  const getProvider = () => {
    const provider = new Provider(connection, solletWallet, {
      preflightCommitment: "confirmed",
    });
    return provider;
  };

  // helper function to get the program
  const getProgram = () => {
    const program = new Program(
      idl as Idl,
      programID,
      getProvider()
    ) as Program<DonationProgram>;
    return program;
  };

  // ======== INITIATE BASE ACCOUNT ========
  
  const getMainAccount = async () => {
    const [donatePDA, donateBump] = await web3.PublicKey.findProgramAddress([Buffer.from(PROGRAM_SEED)], programID);
    BASE_ACCOUNT = donatePDA;
  };

  const initializeAccount = async () => {
    const [donatePDA, donateBump] = await web3.PublicKey.findProgramAddress([Buffer.from(PROGRAM_SEED)], programID);
    BASE_ACCOUNT = donatePDA;
    const provider = getProvider();
    const program = getProgram();
    const _baseAccount = Keypair.generate();
    Keypair;

    const tx = program.transaction.initialize(donateBump,{
      accounts: {
        user: provider.wallet.publicKey,
        donateAccount: BASE_ACCOUNT,     
        systemProgram: SystemProgram.programId,
      },
      signers: [],
    });

    tx.feePayer = provider.wallet.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    const signedTx = await provider.wallet.signTransaction(tx);
    const txId = await connection.sendRawTransaction(signedTx.serialize());
    await connection.confirmTransaction(txId);
    console.log("Transaction " + txId + " confirmed");
  };

  let userAccount = "";
  let lamports = 0;
  const donate = async () => {
    await getMainAccount();
    const provider = getProvider();
    const program = getProgram();
    const [donatorPDA, donatorBump] = await web3.PublicKey.findProgramAddress([Buffer.from(DONATOR_SEED),provider.wallet.publicKey.toBuffer()], programID);

    let isUserExist = false;
    try{
      await program.account.donatorInfo.fetch(donatorPDA);
      isUserExist = true;
    }catch (e){
      console.log(e);

    }
    let tx;
    if(isUserExist){
      tx = program.transaction.donate(new BN(lamports),{
      accounts: {
        donator: provider.wallet.publicKey,
        donatorInfo: donatorPDA,
        donateAccount: BASE_ACCOUNT,       
        systemProgram: SystemProgram.programId,
      },
      signers: [],
    });
    }else{
    tx = program.transaction.initDonator(donatorBump,{
        accounts: {
          donator: provider.wallet.publicKey,
          donatorInfo: donatorPDA,     
          systemProgram: SystemProgram.programId,
        },
        signers: [],
      });
      tx.add(program.transaction.donate(new BN(lamports),{
        accounts: {
          donator: provider.wallet.publicKey,
          donatorInfo: donatorPDA,
          donateAccount: BASE_ACCOUNT,       
          systemProgram: SystemProgram.programId,
        },
        signers: [],
      }));
    }

    tx.feePayer = provider.wallet.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    const signedTx = await provider.wallet.signTransaction(tx);
    const txId = await connection.sendRawTransaction(signedTx.serialize());
    await connection.confirmTransaction(txId);
    console.log("Transaction " + txId + " confirmed");
    await getDonateAccountOwner();
    if(userAccount != ""){
    await getDonationAmmountByAcoount();
    }

  };

  let owner;
  let total = 0;

  const getDonateAccountOwner = async () => {
    await getMainAccount();
    const program = getProgram();
    const account = await program.account.donateAccount.fetch(
      BASE_ACCOUNT
    );
    owner = account.accountOwner;
    total = account.ammount;
  };

  let DonationAmmountByAcoount = 0;
  let isDonationAmmountByAcoount = false;

  
  const getDonationAmmountByAcoount = async () => {
    let userKey = new PublicKey(userAccount)
    const [donatorPDA, donateBump] = await web3.PublicKey.findProgramAddress([Buffer.from(DONATOR_SEED),userKey.toBuffer()], programID);
    const program = getProgram();
    let account;
    try{
      account = await program.account.donatorInfo.fetch(donatorPDA);
      DonationAmmountByAcoount = account.ammount
      //console.log("Got the DonationAmmountByAcoount", account.ammount);
      isDonationAmmountByAcoount = true
    }catch (e){
      console.log(e);
      DonationAmmountByAcoount = 0;
      isDonationAmmountByAcoount = true
    }
  };

  let donatorsList = [];

  const getDonatorsList = async () => {
    await getMainAccount();
    const program = getProgram();
    let account;
    try{
      account = await program.account.donateAccount.fetch(BASE_ACCOUNT);
      donatorsList = account.donators;
    }catch (e){
      console.log(e);
    }
  };

  const withdrawDonations= async () => {
    const provider = getProvider();
    const program = getProgram();
    const tx = program.transaction.withdraw({
      accounts: {
        user: provider.wallet.publicKey,
        donateAccount: BASE_ACCOUNT,
        to: provider.wallet.publicKey,    
        systemProgram: SystemProgram.programId,
      },
      signers: [],
    });

    try {
      tx.feePayer = provider.wallet.publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      const signedTx = await provider.wallet.signTransaction(tx);
      const txId = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txId);
      console.log("Transaction " + txId + " confirmed");
    } catch (err) {
      console.log(err.toString());
    }
    await getDonateAccountOwner();
  };

</script>

<main>
  
  <h1>donation_program, Solana!</h1>

  <div>
  <button on:click={handleConnectWallet}>Connect wallet</button>
  <button on:click={getDonateAccountOwner}>Get total ammount and owner</button>
  {#if account}
  <button on:click={initializeAccount}>Initialize owner account</button>
  <button on:click={withdrawDonations}>withdrawDonations</button>
  {/if}
  </div>
  {#if account}
  <h3>Your wallet: {account}</h3>
  {/if}
  <div style="margin-bottom: 50px;"></div>
  <div class="content">
    {#if account}
    <div>
    <p><strong>Donate lamports:</strong>
      <input
      type="number"
      placeholder="lamports.."
      bind:value={lamports}
    />  
    <button on:click={donate}>Donate</button></p>
  </div>
  {/if}

  <div>
    <strong>Donation ammount by account</strong>
    <input
      type="text"
      placeholder="account.."
      bind:value={userAccount}
    />    
    <button on:click={getDonationAmmountByAcoount}> Get your donation ammount</button>
  {#if isDonationAmmountByAcoount}
  <p>The amount of donations: {DonationAmmountByAcoount} lamports</p>
  {/if}
</div>
  {#if donatorsList}
  <div>
    <p><strong>Donators List:</strong></p>
        <ul>
      {#each donatorsList as donator}
        <li>
           {donator.toString()}
        </li>
      {/each}
    </ul>
    <p><button on:click={getDonatorsList}>Refresh Donators List</button></p> 
  </div>
  {/if}
  {#if total}
  <div>
  <p><strong>Owner:</strong></p>
  <p>Owner key: {owner.toString()}</p>
  <p>Total ammount: {total}</p>
  </div>
  {/if}
 </div>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }
  div{
    margin-bottom: 30px;
    margin-top: 30px;
  }

  .content{
    text-align: left;
  }
  h1 {
    color: #ff3e00;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>

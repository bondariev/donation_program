import * as anchor from "@project-serum/anchor";
import { Program, BN} from "@project-serum/anchor";
import { DonationProgram } from "../target/types/donation_program";
const { PublicKey, Connection} = require("@solana/web3.js");
import assert from "assert";
const programID = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");


let DONATOR_SEED = "donator_8";
let PROGRAM_SEED = "donate_account_21";
const delay = ms => new Promise(res => setTimeout(res, ms));

describe("donation_program", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.DonationProgram as Program<DonationProgram>;

  it("Is initialized!", async () => {

   const [donatePDA, donateBump] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from(PROGRAM_SEED)], programID);
   const user = provider.wallet;
    await program.rpc.initialize(donateBump,{
      accounts: {
        user: provider.wallet.publicKey,
        donateAccount: donatePDA,      
        systemProgram: anchor.web3.SystemProgram.programId
      },
    });
    let donate_account= await program.account.donateAccount.fetch(donatePDA);
    console.log(donate_account.accountOwner.toString());
    console.log(provider.wallet.publicKey.toString());
    assert.equal(donate_account.accountOwner.toString(), provider.wallet.publicKey.toString());
    assert.equal(donate_account.accountOwner.toString(), provider.wallet.publicKey.toString());
    assert.equal(donate_account.bump, donateBump);
  });



it("Is donate!", async () => {

 const [donatePDA, donateBump] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from(PROGRAM_SEED)], programID);
 const [donatorPDA, donatorBump] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from(DONATOR_SEED),provider.wallet.publicKey.toBuffer()], programID);
  await program.rpc.initDonator(donatorBump,{
    accounts: {
      donator: provider.wallet.publicKey,
      donatorInfo: donatorPDA,      
      systemProgram: anchor.web3.SystemProgram.programId
    },
  });
  await program.rpc.donate(new BN(100000000),{
    accounts: {
      donator: provider.wallet.publicKey,
      donatorInfo: donatorPDA,      
      donateAccount:donatePDA,
      systemProgram: anchor.web3.SystemProgram.programId
    },
  });
  let donator_info = await program.account.donatorInfo.fetch(donatorPDA);
  assert.equal(donator_info.bump, donatorBump);
  assert.equal(donator_info.ammount, 100000000);

});


it("Is withdraw!", async () => {
  const [donatePDA, donateBump] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from(PROGRAM_SEED)], programID);
  const cluster = "http://localhost:8899";
  const connection = new Connection(cluster, "confirmed");
  await delay(2000);
  let balance_ammount_before = await connection.getBalance(donatePDA);
  console.log("balance ammount before: ", balance_ammount_before);
  let donate_account_before = await program.account.donateAccount.fetch(donatePDA);
  console.log("donate account ammount before: ", donate_account_before.ammount.toString());
  
  await program.rpc.withdraw({
     accounts: {
       user: provider.wallet.publicKey,    
       donateAccount:donatePDA,
       to:provider.wallet.publicKey,
       systemProgram: anchor.web3.SystemProgram.programId
     },
   });
   await delay(2000);
   let donate_account_after = await program.account.donateAccount.fetch(donatePDA);
   assert.equal(donate_account_after.ammount, 0);
   assert.equal(donate_account_after.accountOwner.toString(), provider.wallet.publicKey.toString());

   let balance_ammount_after= await connection.getBalance(donatePDA);
   console.log("balance ammount after: ", balance_ammount_after);
   assert.equal(balance_ammount_after,balance_ammount_before-donate_account_before.ammount.toNumber());
 });




 it("It is forbidden to initialized more than once!", async () => {
    const [donatePDA, donateBump] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from(PROGRAM_SEED)], programID);
    let user = anchor.web3.Keypair.generate();
    let error = "";
    try{
      await program.rpc.initialize(donateBump,{
        accounts: {
          user: user.publicKey,
          donateAccount: donatePDA,      
          systemProgram: anchor.web3.SystemProgram.programId
        },
        signers: [user],
      });
      assert.ok(false);
    }catch(e){
      console.log(e.message);
    }
  
 });

 it("It is forbidden to withdraw by not owner", async () => {
  const [donatePDA, donateBump] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from(PROGRAM_SEED)], programID);

  let user = anchor.web3.Keypair.generate();
  try{
    await program.rpc.withdraw({
      accounts: {
        user: user.publicKey,    
        donateAccount:donatePDA,
        to:provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      },
      signers: [user],
    });
    assert.ok(false);
  }catch (err) {
    assert(err.toString().includes('YouAreNotTheOwner'));
    console.log(err.toString());
  }
  let donate_account = await program.account.donateAccount.fetch(donatePDA);
  assert.notEqual(user.publicKey.toBase58(),donate_account.accountOwner.toBase58());

 });

});

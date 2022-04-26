use anchor_lang::prelude::*;

pub const DONATOR_SEED: &[u8] = b"donator_9";
pub const PROGRAM_SEED: &[u8] = b"donate_account_22";
declare_id!("3hw9TxUbMuGhmdt8BghBgstGTzWWBjV2qQy9dA5gGr9U");

#[program]
pub mod donation_program{
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, bump: u8) -> Result<()> {
        // Create a new account
        let donate_account: &mut Account<DonateAccount> = &mut ctx.accounts.donate_account;
        donate_account.bump = bump;
        donate_account.account_owner = *ctx.accounts.user.to_account_info().key;
        Ok(())
    }

    pub fn init_donator(ctx: Context<InitDonator>, bump:u8) -> Result<()> {
        let donator_info: &mut Account<DonatorInfo> = &mut ctx.accounts.donator_info;
        donator_info.bump = bump;
        Ok(())
    }

    pub fn donate(ctx: Context<Donate>,data:u64) -> Result<()> {

        let donator_info: &mut Account<DonatorInfo> = &mut ctx.accounts.donator_info;
       
        let sol_transfer = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.donator.key,
            ctx.accounts.donate_account.to_account_info().key,
            data,
        );
        anchor_lang::solana_program::program::invoke(
            &sol_transfer,
            &[
                ctx.accounts.donator.to_account_info(),
                ctx.accounts.donate_account.to_account_info(),
            ],
        )?;

        let donate_account: &mut Account<DonateAccount> = &mut ctx.accounts.donate_account;
        if !donate_account.donators.contains(&ctx.accounts.donator.to_account_info().key) { 
            if donate_account.donators.len() == 310{
                donate_account.donators.clear();
            }
            donate_account.donators.push(*ctx.accounts.donator.to_account_info().key);
        }
        donate_account.ammount = donate_account.ammount + data;
        donator_info.ammount = donator_info.ammount + data;
        msg!("transfer {} lamports from {:?} to {:?}: done", &data, &ctx.accounts.donator.key,  donate_account.to_account_info().key);
        msg!("{:?}", &donate_account.donators);
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {

        // Confirm if passed in owner address is the same

        let donate_account: &mut Account<DonateAccount> = &mut ctx.accounts.donate_account;
        if donate_account.account_owner != ctx.accounts.user.key(){                         
            return Err(error!(ErrorCode::YouAreNotTheOwner))
        };

        let from = donate_account.to_account_info();
        let to = &ctx.accounts.to.to_account_info();
        let ammount = donate_account.ammount;
        //donate_account.to_account_info().lamports();

        // Debit from_account and credit to_account
        **from.try_borrow_mut_lamports()? -= ammount;
        **to.try_borrow_mut_lamports()? += ammount;
        msg!("withdraw {} lamports from {:?} to {:?}: done", &donate_account.ammount, donate_account.to_account_info().key, &ctx.accounts.to.to_account_info());
        donate_account.ammount = 0;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(init,
        payer=user,
        space=DonateAccount::space(),
        seeds=[PROGRAM_SEED],
        bump)]
    pub donate_account: Account<'info, DonateAccount>,
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct InitDonator<'info>{
   #[account(mut)]
    pub donator: Signer<'info>,   
    #[account(init, payer=donator, space=DonatorInfo::space(), seeds=[DONATOR_SEED, donator.key().as_ref()],bump)]
    pub donator_info: Account<'info, DonatorInfo>,           
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Donate<'info>{
   #[account(mut)]
    pub donator: Signer<'info>,   
    #[account(mut, seeds=[DONATOR_SEED, donator.key().as_ref()],bump = donator_info.bump)]
    pub donator_info: Account<'info, DonatorInfo>,       
    #[account(mut)]
    pub donate_account: Account<'info, DonateAccount>,     
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub system_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, seeds=[PROGRAM_SEED],bump = donate_account.bump)]
    pub donate_account: Account<'info, DonateAccount>,  
    #[account(mut)]
    /// CHECK: This is not dangerous because we just pay to this account
    pub to: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(Default)]
pub struct DonateAccount{
  pub account_owner: Pubkey,
  pub bump: u8,
  pub donators: Vec<Pubkey>,
  pub ammount:u64,
}

impl DonateAccount{
    fn space() -> usize {
        // discriminator + owner pubkey + bump
        8 + 32 + 1 +
            // vec of item Donators
            4 + (310 as usize) * std::mem::size_of::<Pubkey>() +
            // u64
            8

    }
}

#[account]
#[derive(Default)]
pub struct DonatorInfo{
    pub bump: u8,
    pub ammount: u64,  
}

impl DonatorInfo{
    fn space() -> usize {
        // discriminator + bump + u64
        8 +  1 + 8
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Only owner can to withdraw")]
    YouAreNotTheOwner,
}


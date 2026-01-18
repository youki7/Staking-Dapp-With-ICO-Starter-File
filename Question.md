# Question List
- Contract
    - StakingDapp
        - _calcPendingReward method: calculating user's reward. his lock days can't be greater than pool's lock days ?
        - important！ Before each transfer function calling, should multiply decimals which comes 
          from IERC20Metadata decimals function

    - TokenICO
        - transfer functions like buyToken and withDraw should be protected by reentrancyguard
        - doesn't use safeERC20 library
        - important! buytokens function: msg.value has a Wei unit and token_price should be similar,
          wei / per token. 
        - Should get decimals from functions and storage in variable instead of hard coding.


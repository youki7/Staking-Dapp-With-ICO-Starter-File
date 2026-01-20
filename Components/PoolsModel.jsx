import React, { useState } from 'react'

import { IoMdClose } from './ReactICON'
import PopUpInputField from './Admin/RegularComp/PopUpInputField'
import PopUpButton from './Admin/RegularComp/PopUpButton'
import InputRatio from './Admin/RegularComp/InputRatio'

const PoolsModel = ({
  deposit,
  poolId,
  address,
  selectedPool,
  selectedToken,
  setLoader,
}) => {
  const [amount, setAmount] = useState()
  const CALLING_FUNCTION = async (poolId, amount, address) => {
    setLoader(true)
    const receipt = await deposit(poolId, amount, address)
    if (receipt?.blockNumber) {
      console.log(receipt)
      setLoader(false)
      window.location.reload()
    }
    setLoader(false)
  }
  return (
    <div
      className="modal modal--auto fade"
      id="modal-apool"
      tabIndex={-1}
      aria-labelledby="modal-apool"
      aria-hidden
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal__content">
            <button
              className="modal__close"
              type="button"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              <i className="ti ti-x">
                <IoMdClose />
              </i>
            </button>
            <h4 className="modal__title">Invest</h4>
            <p className="modal__text">
              Welcome to Crypto King, stake your&nbsp;
              {selectedPool?.depositToken.name} to earn reward
            </p>
            <div className="modal__form">
              <PopUpInputField
                title={`Stake ${selectedPool?.depositToken.name} token`}
                placeholder="Amount"
                handleChange={(e) => setAmount(e.target.value)}
              />
              <div className="form__group">
                <label htmlFor="" className="form__label">
                  Pool Details:
                </label>
                <ul className="form__radio">
                  <InputRatio
                    index={1}
                    value={`Your Deposited: ${selectedPool?.amount} ${selectedPool?.depositToken.symbol}`}
                  />
                  <InputRatio
                    index={2}
                    value={`Total Deposited: ${
                      selectedPool?.depositedAmount ?? 0
                    } ${selectedPool?.depositToken.symbol}`}
                  />
                  <InputRatio
                    index={3}
                    value={`My Balance: ${selectedPool?.depositToken.balance.slice(
                      0,
                      8
                    )} ${selectedPool?.depositToken.symbol}`}
                  />
                </ul>
              </div>
              <PopUpButton
                title="Proceed"
                handleClick={(e) => CALLING_FUNCTION(poolId, amount, address)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PoolsModel

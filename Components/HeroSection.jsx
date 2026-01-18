import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY

import { LOAD_TOKEN_ICO } from '../Context/constants'
import { TiTick } from './ReactICON'

const HeroSection = ({ addTokenToMetaMask }) => {
  const { address } = useAccount()
  const [percentage, setPercentage] = useState()
  const [tokenDetails, setTokenDetails] = useState()

  useEffect(() => {
    if (address) {
      const loadToken = async () => {
        const token = await LOAD_TOKEN_ICO()
        setTokenDetails(token)
      }
      loadToken()
    }
  }, [address])

  useEffect(() => {
    const calculatePercentage = () => {
      const tokenSold = tokenDetails?.soldTokens ?? 0
      const tokenTotalSupply =
        (tokenDetails?.soldTokens + Number(tokenDetails?.tokenBal)) * 1 ?? 1

      if (tokenTotalSupply === 0) {
        console.log('Token balance is zero, cannot calculate percentage')
      } else {
        const newPercentage = (tokenSold / tokenTotalSupply) * 100
        setPercentage(newPercentage)
      }
    }

    const interval = setInterval(calculatePercentage, 1000)
    return () => clearInterval(interval)
  }, [tokenDetails])

  return (
    <section id="home" className="hero">
      <div className="container">
        <div className="row">
          <div className="col-12 col-lg-7 col-xl-6">
            <div className="hero__content hero__content-first">
              <h1 className="hero__title">
                <strong>Crypto King </strong>
                <br />
                Best return on your investment
              </h1>
              <div className="hero__btns">
                <a
                  data-bs-target="#modal-deposit1"
                  type="button"
                  data-bs-toggle="modal"
                  className="hero__btn"
                >
                  BUY {tokenDetails?.symbol || ''} Token
                </a>
                <a
                  onClick={() => addTokenToMetaMask()}
                  className="hero__btn hero__btn--light"
                >
                  Add Token {tokenDetails?.symbol || ''}
                </a>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-5 col-xl-4 offset-xl-2 ">
            <div className="hero__content hero__content--second">
              <div className="node node--hero">
                <h3 className="node__title node__title--red">
                  <b>{tokenDetails?.symbol || ''}</b> Token ICO
                </h3>
                <span className="node__date">
                  {tokenDetails?.tokenPrice || ''}
                  {CURRENCY}
                </span>
                <span className="node__price">
                  ICO Left:{' '}
                  <b>
                    {tokenDetails?.tokenBal || ''} {tokenDetails?.symbol}
                  </b>
                </span>
                <span className="node__line">
                  <img src="img/dodgers/dots--line-red.svg" alt="" />
                </span>
                <ul className="node__list">
                  <li>
                    <i className="ti">
                      <TiTick />
                    </i>
                    <b>1.1%</b> of the deposit amount
                  </li>
                  <li>
                    <i className="ti">
                      <TiTick />
                    </i>
                    <b>
                      {tokenDetails?.supply} {tokenDetails?.symbol}
                    </b>
                    &nbsp;total supply
                  </li>
                </ul>
                <div className="progressbar progressbar--cta">
                  <h3 className="progressbar__title">
                    ICO Sale:{tokenDetails?.soldTokens} {tokenDetails?.symbol}
                  </h3>
                  <div
                    className="progress"
                    role="progressbar"
                    aria-label="Animated striped"
                    aria-valuenow={75}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated"
                      style={{ width: `${percentage}%` }}
                    >
                      <span>{tokenDetails?.soldTokens}</span>
                    </div>
                  </div>
                  <div className="progressbar__values">
                    <span className="progressbar__value progressbar__value--left"></span>
                    <span className="progressbar__value progressbar__value--right">
                      {Number(tokenDetails?.tokenBal || 0) +
                        Number(tokenDetails?.soldTokens || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection

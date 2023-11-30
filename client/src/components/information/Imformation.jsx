import React from 'react'
import './information.css'

const Imformation = ({otherUserDetails}) => {
  return (
    <div className='IF-main-container'>
        <div className='IF-profile-pic'>
        <img src={otherUserDetails?.profile_pic || "https://picsum.photos/200/200"} alt="" width="40px" height="40px"/>
        </div>
        <div className='IF-user-name'>
          <h3>{otherUserDetails?.name}</h3>
          <p>{"offline"}</p>
        </div>
        <div className='IF-mini-info'>
            <p className='IF-primary-info'>
                Email
            </p>
            <p className='IF-secondary-info'>
                {otherUserDetails?.email || 'Email not Provided'}
            </p>
        </div>
        <div className='IF-mini-info'>
            <p className='IF-primary-info'>
                Phone
            </p>
            <p className='IF-secondary-info'>
                { ("+91 "+ otherUserDetails?.phone_number) || 'Phone not Provided'}
            </p>
        </div>
        <div className='IF-mini-info'>
            <p className='IF-primary-info'>
                Address
            </p>
            <p className='IF-secondary-info'>
                {otherUserDetails?.address || 'Address not Provided'}
            </p>
        </div>
        <div className='IF-mini-info'>
            <p className='IF-primary-info'>
                Joined 
            </p>
            <p className='IF-secondary-info'>
                {otherUserDetails?.createdAt || 'Join not Found'}
            </p>
        </div>
        
        <div className='Block-btn'> 
            Block
        </div>
    </div>
  )
}

export default Imformation
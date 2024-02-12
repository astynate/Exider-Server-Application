import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../processes/Registration";
import InputCheck from "../../shared/input-check/InputCheck";
import Button from "../../shared/button/Button";
import ValidationHandler from "../../../../utils/handlers/ValidationHandler";

const Nickname = () => {

    const user = useContext(UserContext);
    const [nickname, setNickname] = useState(user.nickname);
    const [validationState, setValidationState] = useState('none');
    const [isValidNickname, setValidationData] = useState(ValidationHandler
        .ValidateVarchar(nickname, 30));

    useEffect(() => {

        user.nickname = nickname;

        setValidationData(false);
        setValidationState('none');

        if (ValidationHandler.ValidateVarchar(nickname, 30)) {

            const timeoutId = setTimeout(() => {

                setValidationData(true);
                setValidationState('loading');

            }, 1000);

            return () => clearTimeout(timeoutId);

        }

    }, [user, nickname]);

    return (

        <>
            <h1>Creation of <span className="selected-text">Exider ID</span></h1>
            <p>Please enter your nickname. This is a required field. Your nickname<br /> must be unique</p>
            <InputCheck
                placeholder="Nickname"
                autofocus={true}
                defaultValue={user.nickname}
                SetValue={setNickname}
                state={validationState}
            />
            <Link to='/account/create/name'>
                <Button
                    title="Next"
                    disabled={!isValidNickname}
                />
            </Link>
        </>

    );

}

export default Nickname;
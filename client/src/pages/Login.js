import React, {useState} from 'react';
import {Form, Button, Row, Col} from 'react-bootstrap';
import {gql, useLazyQuery} from "@apollo/client";
import {Link} from "react-router-dom";
import {useAuthDispatch} from "../contexts/auth";

const LOGIN_USER = gql`
    query login($username: String $password: String){
        login(username: $username password: $password ){
            username, token
        }
    }
`;

const Login = (props) => {

    const [errors, setErrors] = useState({});

    const dispatch = useAuthDispatch();

    const [loginUser, {loading}] = useLazyQuery(LOGIN_USER, {
        onError: (err)=>{
            let errors = err?.graphQLErrors[0]?.extensions?.errors;
            if(errors) {
                setErrors(errors);
            }else {
                console.log(err)
            }
        },
        onCompleted: (data) => {
            dispatch({
                type: 'LOGIN',
                payload: data.login
            })
            window.location.href = '/';
        }
    });

    function submitLoginForm(ev) {
        ev.preventDefault();
        let form = ev.target;

        let username = form.username.value;
        let password = form.password.value;

        loginUser({
            variables: {username, password}
        });

        //form.reset();
    }

    return (
        <Row>
            <Col md={{span: 4, offset: 4}} className="bg-white p-5">
                <h2 className="text-center">
                    Login
                </h2>
                <Form method="POST" onSubmit={submitLoginForm}>
                    <Form.Group className="mb-3" controlId="username">
                        <Form.Label className={errors.username && 'text-danger'}>
                            {errors.username ? errors.username : 'Username'}
                        </Form.Label>
                        <Form.Control className={errors.username && 'is-invalid'} type="text" name="username"/>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="password">
                        <Form.Label className={errors.password && 'text-danger'}>
                            {errors.password ? errors.password : 'Password'}
                        </Form.Label>
                        <Form.Control className={errors.password && 'is-invalid'} type="password" name="password"/>
                    </Form.Group>

                    <div className="text-center">
                        <Button variant="success" disabled={loading} type="submit" className="text-white">
                            {loading ? 'Loading...' : 'Login'}
                        </Button>
                        <br/>
                        <small>Don't have an account? <Link to="/signup">signup</Link></small>
                    </div>
                </Form>
            </Col>
        </Row>
    );
};

export default Login;
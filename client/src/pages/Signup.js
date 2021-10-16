import React, {useState} from 'react';
import {Form, Button, Row, Col} from 'react-bootstrap';
import {gql, useMutation} from "@apollo/client";
import {Link} from "react-router-dom";

const SIGNUP_USER = gql`
    mutation register($username: String $email: String $password: String $confirmPassword: String){
        register(username: $username email: $email password: $password confirmPassword: $confirmPassword){
            username, email, createdAt
        }
    }
`;

const Signup = (props) => {

    const [errors, setErrors] = useState({});

    const [signupUser, {loading}] = useMutation(SIGNUP_USER, {
        update: (_, res) => {
            props.history.push('/login');
        },
        onError: (err) => {
            setErrors(err.graphQLErrors[0].extensions.errors);
        }
    });

    function submitSignupForm(ev) {
        ev.preventDefault();
        let form = ev.target;

        let username = form.username.value;
        let email = form.email.value;
        let password = form.password.value;
        let confirmPassword = form.confirmPassword.value;

        signupUser({
            variables: {username, email, password, confirmPassword}
        });

        //form.reset();
    }

    return (
        <Row>
            <Col md={{span: 4, offset: 4}} className="bg-white p-5">
                <h2 className="text-center">
                    Register
                </h2>
                <Form method="POST" onSubmit={submitSignupForm}>
                    <Form.Group className="mb-3" controlId="username">
                        <Form.Label className={errors.username && 'text-danger'}>
                            {errors.username ? errors.username : 'Username'}
                        </Form.Label>
                        <Form.Control className={errors.username && 'is-invalid'} type="text" name="username"/>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label className={errors.email && 'text-danger'}>
                            {errors.email ? errors.email : 'Email address'}
                        </Form.Label>
                        <Form.Control className={errors.email && 'is-invalid'} type="text" name="email"/>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="password">
                        <Form.Label className={errors.password && 'text-danger'}>
                            {errors.password ? errors.password : 'Password'}
                        </Form.Label>
                        <Form.Control className={errors.password && 'is-invalid'} type="password" name="password"/>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="confirmPassword">
                        <Form.Label className={errors.confirmPassword && 'text-danger'}>
                            {errors.confirmPassword ? errors.confirmPassword : 'Confirm Password'}
                        </Form.Label>
                        <Form.Control className={errors.confirmPassword && 'is-invalid'} type="password"
                                      name="confirmPassword"/>
                    </Form.Group>

                    <div className="text-center">
                        <Button variant="success" disabled={loading} type="submit" className="text-white">
                            {loading ? 'Loading...' : 'Signup'}
                        </Button>
                        <br/>
                        <small>Have an account? <Link to="/login">login</Link></small>
                    </div>
                </Form>
            </Col>
        </Row>
    );
};

export default Signup;
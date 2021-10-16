import './App.scss';
import {Container} from "react-bootstrap";
import ApolloProvider from "./ApolloProvider";
import {BrowserRouter as Router, Switch} from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/home/Home";
import {AuthProvider} from "./contexts/auth";
import DynamicRoute from "./util/DynamicRoute";
import {MessageProvider} from "./contexts/message";

function App() {
    return (
        <ApolloProvider>
            <AuthProvider>
                <MessageProvider>
                    <div className="app mt-5">
                        <Container>
                            <Router>
                                <Switch>
                                    <DynamicRoute path="/" component={Home} exact authenticated/>
                                    <DynamicRoute path="/login" component={Login} exact guest/>
                                    <DynamicRoute path="/signup" component={Signup} exact guest/>
                                </Switch>
                            </Router>
                        </Container>
                    </div>
                </MessageProvider>
            </AuthProvider>
        </ApolloProvider>
    );
}

export default App;

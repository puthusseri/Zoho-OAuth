var scopeHistory = [];
        function initialize()
        {
            // if the local storage contains the previous scopes, load that to our global array
            if(localStorage.scopeHistory){ 
                scopeHistory = localStorage.getItem("scopeHistory").split(";");
                scopeHistory.pop(); // last item will be an empty value, so remove that 
            }
            // if the client id is there in the local storage, then use that
            if(localStorage.productionClientID)
            {
                document.getElementById("clientID").value = localStorage.productionClientID;
            }
            if(localStorage.lastUsedScope)
            {
                document.getElementById("scope").value = localStorage.lastUsedScope;
            }
            // if the redirect url is present in the local storage, then use that 
            if(localStorage.redirectURL)
            {
                document.getElementById("redirect_url").value = localStorage.redirectURL;
            }
            if(localStorage.access_code){
                document.getElementById("access_code").value = localStorage.access_code;
            }
        }
        $(document).ready(function(){
            initialize();
        });
        const copyToClipboard = str => {
            console.log("copying the access code to clipboard");
            const el = document.createElement('textarea');
            el.value = str;
            el.setAttribute('readonly', '');
            el.style.position = 'absolute';
            el.style.left = '-9999px';
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        };
        function copyContent(){
            var data = document.getElementById("access_code").value;
            
            copyToClipboard(data);
            $('#snackbar').text("Access code copied");
            popUpMessage();
        }
        function generateAuthenticationCode()
        {
            var radioButtons = document.getElementsByName("serverType");
            var serverType =  Array.from(radioButtons).find(radio => radio.checked).value.trim();
            var clientID = document.getElementById("clientID").value.trim();
            var scope = document.getElementById("scope").value.trim();
            var redirectURL = document.getElementById("redirect_url").value.trim();
            var url = "";
            // if the last character of the scope has a comma, then remove that 
            if(scope.charAt(scope.length-1) == ",")
            {
                // remove that comma
                scope = scope.substring(0, scope.length - 1);
                console.log(scope);
            }

            // if the scope contains any white space, then ask to remove that,
            if(scope.indexOf(' ') !== -1)
            {
                // there is an unwanted space,
                $('#snackbar').text("Remove the spaces in scope");
                popUpMessage(); 
                return;

            }
            

            // save the current client id, scope and redirect url to the localstorage
            localStorage.setItem("redirectURL", redirectURL);
            localStorage.setItem("lastUsedScope", scope);
            // save the current scope to the local storage
            if(scopeHistory.includes(scope) == false)
            {
                // a new scope, so add it to the array
                scopeHistory.push(scope);
                var stringScope = "";
                for(var i=0;i<scopeHistory.length;i++)
                {
                    stringScope += scopeHistory[i]+";";
                }
                // add it to the localstorage
                localStorage.setItem("scopeHistory", stringScope);
            }
            
            if(serverType === "production")
            {
            // then make the form submit to the production server
                url = "https://accounts.zoho.com/oauth/v2/auth?response_type=token&client_id="+clientID+"&scope="+scope+"&redirect_uri="+redirectURL;
                localStorage.setItem("productionClientID",clientID);
            }
            else if(serverType === "local")
            {
                // load in the localzoho
                url = "https://accounts.localzoho.com/oauth/v2/auth?response_type=token&client_id="+clientID+"&scope="+scope+"&redirect_uri="+redirectURL;
                localStorage.setItem("localClientID",clientID);
            }
            else{
                // load in the development
                url = "https://accounts.csez.zohocorpin.com/oauth/v2/auth?response_type=token&client_id="+clientID+"&scope="+scope+"&redirect_uri="+redirectURL;
                localStorage.setItem("developmentClientID",clientID);
            }
            // console.log(url);
            let myPromis = new Promise((resolve, reject) => {

                    let authorizationWindow = window.open(url, '_blank');
                    // console.log(authorizationWindow);
                        c1 = setInterval(() => {
                            try{
                                let hash_data = authorizationWindow.location.hash;
                                if(hash_data){
                                    
                                    console.log("hash data = "+hash_data);
                                    authorizationWindow.close();        // close that window
                                    resolve(hash_data);                 // call the success function
                                }
                            }
                            catch (e) {
                                console.log(e);
                            }
                        },1000);
                        ct = setTimeout(() => {
                            reject("failed");
                            authorizationWindow.close();
                        }, 50000);
                        
            })

            myPromis.then((hash_data) => {
                console.log("Inside the success function, hash data : "+hash_data);
                var access_code = hash_data.match('[#&]access_token=*[^&]*')[0].split("=")[1]; 
                document.getElementById("access_code").value = access_code;      
                localStorage.access_code = access_code;
                console.log(access_code);
                
                // copyContent();
                // 
                
            }).catch((messge) => {
                console.log("Inside the failed function"+messge);
            });
        }

        function loadScope(scope)
        {
            // load the value of the scope to the form field
            document.getElementById("scope").value = scope;
        }
        function loadHistory()
        {
            if(document.getElementById("scopeHistorySelection"))
            {
                // so that multiple fields wont get generated, removing the old one
                document.getElementById("scopeHistorySelection").remove();
            }
            // load the history of the scope to the div, from the local storage 
            let select = document.createElement("select");
            select.name = "scopeHistorySelection";
            select.id = "scopeHistorySelection";

            let option = document.createElement("option");
            option.text="select the previous scopes used";
            option.disabled = true;
            // option.selected = true;
            select.appendChild(option);
            for(i of scopeHistory)
            {
                // add it as options
                let option = document.createElement("option");
                option.value = i;
                option.text = i;
                option.className="scopeOptions";
                select.appendChild(option);
            }
            document.getElementById("scope").parentNode.insertBefore(select, document.getElementById("scope").nextSibling);
            
            $("#scopeHistorySelection").click(function() {
                // load that scope to the form filed and remove the temporary created select box
                let temp = document.getElementById("scopeHistorySelection");
                document.getElementById("scope").value = temp.options[temp.selectedIndex].text;
                document.getElementById("scopeHistorySelection").remove();
            });
            $('select').hover(function() {
                // for opening the select box on hover
                $(this).attr('size', $('option').length);
                }, function() {
                $(this).attr('size', 1);
            });
        }

        function changeClientIDBasedOnServerType()
        {
            let serverType = $("input[type='radio'][name='serverType']:checked").val();
            if(serverType == "production"){
                // load the client id of the production from the local storage., if exist
                if(localStorage.productionClientID){
                    document.getElementById("clientID").value = localStorage.productionClientID;
                }
                else{
                    document.getElementById("clientID").value = "1000.XHAQDYIOTKUH9A8UCX8ZFTCW2W48ZL";
                    document.getElementById("clientID").placeholder="No client id found";
                }
            }
            else if(serverType == "local"){
                // load the client id of the local from the local storage., if exist
                if(localStorage.localClientID){
                    document.getElementById("clientID").value = localStorage.localClientID;
                }
                else{
                    document.getElementById("clientID").value = "1000.5JZ9UX2LKAFY2YZHAFDESX1N0KGOQQ";
                    document.getElementById("clientID").placeholder="No client id found";
                }
            } else {
                // load the client id of the development from the local storage., if exist
                if(localStorage.developmentClientID){
                    document.getElementById("clientID").value = localStorage.developmentClientID;
                }
                else{
                    document.getElementById("clientID").value = "1000.HBPQ88AGCBCPJ3TSF6TVKQIOQ27D6F";
                    document.getElementById("clientID").placeholder="No client id found";
                }
            }
        }
        function popUpMessage() {
            var x = document.getElementById("snackbar");
            x.className = "show";
            setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
        }
        function clearHistory()
        {
            localStorage.clear();
            console.log("entering");
            $('#snackbar').text("Clearing History");
            popUpMessage(); 
        }
        
        
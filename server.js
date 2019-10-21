const express = require('express');
const app = express();

const {Datastore} = require('@google-cloud/datastore');
const bodyParser = require('body-parser');

const datastore = new Datastore();

const BOAT = "Boat";

const Slip = "Slip";

const boats = express.Router();

app.use(bodyParser.json());

function fromDatastore(item){
    item.id = item[Datastore.KEY].id;
    return item;
}

/* ------------- Begin Lodging Model Functions ------------- */
function post_boat(name, type, length){
    var key = datastore.key(BOAT);
	const new_boat = {"name": name, "type": type, "length": length};
	return datastore.save({"key":key, "data":new_boat}).then(() => {return key});
}

function get_boats(){
	const q = datastore.createQuery(BOAT);
	return datastore.runQuery(q).then( (entities) => {
			return entities[0].map(fromDatastore);
		});
}

function patch_boat(id, name, type, length){
    const key = datastore.key([BOAT, parseInt(id,10)]);
    const boat = {"name": name, "type": type, "length": length};
    return datastore.update({"key":key, "data":boat}).then(() => {return key});
}

function delete_boat(id){
    const key = datastore.key([BOAT, parseInt(id,10)]);
    return datastore.delete(key); 
}

function get_boat(id)
{
    const key = datastore.key([BOAT, parseInt(id,10)]);
    return datastore.get(key);
}

function createJSONResp(boat, idAdd, selfAdd)
{
    var myJSON = boat[0];
    myJSON.id = idAdd;
    myJSON.self = selfAdd;
    return myJSON;
}

function createJSONRespArray(boats, selfAdd)
{
    var myJSON = [];
    for(i = 0; i < boats.length; i++)
    {
        myJSON[i] = boats[i];
        myJSON[i].self = selfAdd + myJSON[i].id
    }
    return myJSON;
}

/* ------------- End Model Functions ------------- */

/* ------------- Begin Controller Functions ------------- */

boats.get('/', function(req, res){
    const boats = get_boats()
	.then( (boats) => {
        selfBase = req.protocol + '://' + req.get('host') + req.baseUrl + '/';

        res.status(200).json(createJSONRespArray(boats, selfBase));
    });
});

boats.post('/', function(req, res){
	if(req.body.name == null || req.body.type == null || req.body.length == null)
    {
		res.status(400).send('{ "Error":  "The request object is missing at least one of the required attribute" }')
    }
   else
    {
        post_boat(req.body.name, req.body.type, req.body.length)
        .then( key => {
            const boat = get_boat(key.id).then( (boat) => {
                self = req.protocol + '://' + req.get('host') + req.baseUrl + '/' + key.id;
                res.status(201).json(createJSONResp(boat, key.id, self));
            });
        });
    }
});

boats.patch('/:id', function(req, res){
    if(req.body.name == null || req.body.type == null || req.body.length == null)
    {
		res.status(400).json({Error:  "The request object is missing at least one of the required attribute"})
    }
    else
    {
        patch_boat(req.params.id, req.body.name, req.body.type, req.body.length)
        .then(key => {
            const boat = get_boat(key.id).then( (boat) => {
                self = req.protocol + '://' + req.get('host') + req.baseUrl + '/' + key.id;
                res.status(200).json(createJSONResp(boat, key.id, self));
            });
        });
    }
});

boats.get('/:id', function(req, res){
    const boat = get_boat(req.params.id).then( (boat) => {
        if(boat[0] == null)
        {
            res.status(404).json({Error:  "No boat with this boat_id exists"});
        }
        else
        {
            self = req.protocol + '://' + req.get('host') + req.baseUrl + '/' + req.params.id;
            res.status(200).json(createJSONResp(boat, req.params.id, self));
        }
    } );
});

boats.delete('/:id', function(req, res){
    const boat = get_boat(req.params.id).then( (boat) => {
    if(boat[0] == null)
    {
        res.status(404).json({Error:  "No boat with this boat_id exists"});
    }
    else
    {
        delete_boat(req.params.id).then(res.status(200).end());
    }
    });
});

/* ------------- End Controller Functions ------------- */

app.use('/boats', boats);

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening to 90's R&B on port ${PORT}...`);
});
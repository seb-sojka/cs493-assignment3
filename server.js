const express = require('express');
const app = express();

const {Datastore} = require('@google-cloud/datastore');
const bodyParser = require('body-parser');

const datastore = new Datastore();

const BOAT = "Boat";

const Slip = "Slip";

const router = express.Router();

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

function put__boat(id, name, type, length){
    const key = datastore.key([BOAT, parseInt(id,10)]);
    const boat = {"name": name, "type": type, "length": length};
    return datastore.save({"key":key, "data":boat});
}

function delete_boat(id){
    const key = datastore.key([BOAT, parseInt(id,10)]);
    return datastore.delete(key); 
}

/* ------------- End Model Functions ------------- */

/* ------------- Begin Controller Functions ------------- */

router.get('/boat', function(req, res){
    const boats = get_boats()
	.then( (boats) => {
        res.status(200).json(boats);
    });
});

router.post('/boat', function(req, res){
    post_boat(req.body.name, req.body.type, req.body.length)
    .then( key => {res.status(200).send('{ "id": ' + key.id + ' }')} );
});

router.put('/boat/:id', function(req, res){
    put_boat(req.params.id, req.body.name, req.body.type, req.body.length)
    .then(res.status(200).end());
});

router.delete('/boat/:id', function(req, res){
    delete_boat(req.params.id).then(res.status(200).end())
});

/* ------------- End Controller Functions ------------- */

app.use('/lodgings', router);

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening to 90's R&B on port ${PORT}...`);
});
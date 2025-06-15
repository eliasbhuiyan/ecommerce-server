const RoleCheck = (role)=>{    
 return (req, res, next)=>{
     if(role.includes(req.user.role)){
        next()
    }
    else{
        res.status(400).send({error: "Invalid user role!"})
    }
 }
}

module.exports = RoleCheck
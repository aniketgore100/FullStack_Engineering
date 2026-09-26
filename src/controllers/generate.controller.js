

export const generate = async(req, res) =>{
    try{
        const prompt = req.body;
        console.log("prompt :: ", prompt);
    }catch(error){
        console.error(error);
        return res.status(401).json({
            message : "Something Went Wrong"
        })
    }
}

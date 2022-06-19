const express = require('express');
const app = express();
const { cloudinary } = require('./utils/cloudinary');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.get('/api/images', async (req, res) => {
    const { resources } = await cloudinary.search
        .expression('folder: pictures')
        .with_field('context')
        .sort_by('public_id', 'desc')
        .max_results(30)
        .execute();
    const publicIds = resources.map(file => {
        console.log(file);
        return {
            public_id: file.public_id,
            url: file.secure_url,
            text: file.context,
        }
    });
    res.send(publicIds);
})
app.post('/api/upload', async (req, res) => {
    try {
        const fileStr = req.body.data;
        const captionText = req.body.caption;
        const uploadResponse = await cloudinary.uploader.upload(fileStr, {
            upload_preset: 'kahikatea_api',
            context: {'caption': captionText},
            folder: 'pictures',
            tags: 'gallery',
        });
        console.log(uploadResponse);
        res.json({ msg: 'Successfully uploaded to cloudinary' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: 'Something went wrong' });
    }
});
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

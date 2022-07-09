import { TwitterApi } from "twitter-api-v2";
import jimp from "jimp";
import dotenv from "dotenv";

dotenv.config();

const client = new TwitterApi({
	appKey: process.env.appKey,
	appSecret: process.env.appSecret,
	accessToken: process.env.accessToken,
	accessSecret: process.env.accessSecret,
});

let followers_glob = [];

async function saveUserPics() {
	const followers = await client.v2.followers("1479752045397790724", {
		max_results: 3,
	});

	followers_glob = followers.data.map((fol) => fol.username);

	const user_names = [];

	followers.data.forEach(({ username }) => user_names.push(username));

	const save_pic = async (username) => {
		// Get the user's profile image from the API
		const user = await client.v1.user({user_id: username});
		const image = await jimp.read(user.profile_image_url_https);
		image.write(`${username}.png`);
	};


	Promise.all(user_names.map(save_pic)).then(image)
}

saveUserPics();

async function image() {
	const image = await jimp.read("static/1500x500.png");
	let mask = await jimp.read(`${followers_glob[0]}.png`);
	const font = await jimp.loadFont("fonts/fnt.fnt");

	image.resize(1500, 500);
	image.print(font, 100, 110, "Latest followers");

	mask.resize(100, 100);
	mask.circle();
	image.composite(mask, 110, 216);

	mask = await jimp.read(`${followers_glob[1]}.png`);
	mask.resize(80, 80);
	mask.circle();
	image.composite(mask, 230, 170);

	mask = await jimp.read(`${followers_glob[2]}.png`);
	mask.resize(80, 80);
	mask.circle();
	image.composite(mask, 240, 260);

	image.write("static/test.png", async () => {
		await client.v1.updateAccountProfileBanner("./static/test.png");
	});
}

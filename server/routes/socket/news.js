const { logger } = require('../../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling

const { Article } = require('../../models/article');

module.exports = async function (client, req) {
	try {
		logger.info(`${client.username} has made a ${req.action} request in the ${req.route} route!`);
		switch(req.action) {
		case('post'): {
			const { publisher, location, headline, body, tags, imageSrc } = req.data.article; // REQ Destructure

			await Article.post({
				publisher,
				location,
				headline,
				body,
				tags,
				imageSrc
			});
			client.emit('alert', { type: 'success', message: 'Posted Article' });
			break;
		}
		case('edit'): {
			const { _id, publisher, location, headline, body, tags, imageSrc } = req.data.article; // REQ Destructure

			let article = await Article.findById(_id);

			article = await article.edit({
				publisher,
				location,
				headline,
				body,
				tags,
				imageSrc
			});
			client.emit('alert', { type: 'success', message: `Edited Article` });
			break;
		}
		case('publish'): {
			let article = await Article.findById(req.data.id);

			article = await article.publish();
			client.emit('alert', { type: 'success', message: `Published Article` });
			break;
		}
		case('react'): {
			let article = await Article.findById(req.data.id);

			let reacted = article.reactions.some(reaction => reaction.user == req.data.user && reaction.emoji == req.data.emoji);
			if (reacted) {
				article = await article.unreact(req.data.user, req.data.emoji);
				client.emit('alert', { type: 'success', message: `Unreacted with ${req.data.emoji}`});
			}
			else {
				article = await article.react(req.data.user, req.data.emoji);
				client.emit('alert', { type: 'success', message: `Reacted with ${req.data.emoji}`});
			}
			break;
		}
		case('comment'): {
			let article = await Article.findById(req.data.id);

			article = await article.comment(req.data.user, req.data.comment);
			client.emit('alert', { type: 'success', message: 'Posted Comment' });
			break;
		}
		case('deleteComment'): {
			let article = await Article.findById(req.data.id);

			article = await article.deleteComment(req.data.commentId);
			client.emit('alert', { type: 'success', message: `Deleted Comment` });
			break;
		}
		case('delete'): {
			let article = await Article.findById(req.data.id);

			article = await article.delete();
			client.emit('alert', { type: 'success', message: 'Deleted Article' });
			break;
		}
		default: {
			let message = `No ${req.action} is in the ${req.route} route.`;
			throw new Error(message);
		}
		}
	}
	catch (error) {
		client.emit('alert', { type: 'error', message: error.message ? error.message : error });
		logger.error(error);
	}
};
const { logger } = require('../../middleware/log/winston'); // middleware/error.js which is running [npm] winston for error handling

const { Article } = require('../../models/article');

module.exports = async function (client, req) {
	try {
		logger.info(`${client.username} has made a ${req.action} request in the ${req.route} route!`);
		switch(req.action) {
		case('post'): {
			const { publisher, location, headline, body, tags, imageSrc } = req.data.article;

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
			const { id } = req.data;
			const { publisher, location, headline, body, tags, imageSrc } = req.data.article;

			let article = await Article.findById(id);

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
			const { id } = req.data;

			let article = await Article.findById(id);

			article = await article.publish();
			client.emit('alert', { type: 'success', message: `Published Article` });
			break;
		}
		case('react'): {
			const { id, user, emoji } = req.data;

			let article = await Article.findById(id);

			let reacted = article.reactions.some(reaction => reaction.user == user && reaction.emoji == emoji);
			if (reacted) {
				article = await article.unreact(user, emoji);
				client.emit('alert', { type: 'success', message: `Unreacted with ${emoji}`});
			}
			else {
				article = await article.react(user, emoji);
				client.emit('alert', { type: 'success', message: `Reacted with ${emoji}`});
			}
			break;
		}
		case('comment'): {
			const { id, user, comment } = req.data;

			let article = await Article.findById(id);

			article = await article.comment(user, comment);
			client.emit('alert', { type: 'success', message: 'Posted Comment' });
			break;
		}
		case('deleteComment'): {
			const { id, commentId } = req.data;

			let article = await Article.findById(id);

			article = await article.deleteComment(commentId);
			client.emit('alert', { type: 'success', message: `Deleted Comment` });
			break;
		}
		case('delete'): {
			const { id } = req.data; 

			let article = await Article.findById(id);

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
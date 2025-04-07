module.exports = {
	tagFormat: '${version}',
	branches: 'main',
	plugins: [
		'@semantic-release/commit-analyzer',
		'@semantic-release/release-notes-generator',
		[
			'@semantic-release/changelog',
			{
				changelogTitle: '# Release notes',
			},
		],
		'@semantic-release/npm',
		'@semantic-release/git',
	],
};

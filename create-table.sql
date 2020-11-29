create table github (
	id BIGINT Primary Key,
	name varchar(255),
	html_url varchar(255),
	description varchar(255),
	created_at varchar(255),
	open_issues BIGINT,
	watchers BIGINT,
	owner json
);
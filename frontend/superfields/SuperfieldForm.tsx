import loglevel from "loglevel";
const log = loglevel.getLogger("SuperfieldForm");
log.setLevel("debug");

import React from "react";

import { observer } from "mobx-react-lite";

import { Form, Select } from "antd";
const { Option } = Select;

import { StyledFormItem, StyledSubmitButton } from "../StyledComponents";

import viewModel, { SuperfieldType } from "../ViewModel";
import SuperfieldFormField from "../models/SuperfieldFormField";
import BoundSelect from "../components/BoundSelect";
import TableSelector from "../components/TableSelector";
import BoundInput from "../components/BoundInput";
import languagePackStore from "../models/LanguagePackStore";
import Superfield from "../models/Superfield";

const SuperfieldForm = observer(
	({ field, children }: { field: Superfield; children?: any }) => {
		log.debug("SuperfieldForm.render");

		const [form] = Form.useForm();

		const tableId = field.table ? field.table.id : null;

		log.debug("SuperfieldForm, tableId:", tableId);

		form.setFieldsValue({
			table: tableId,
			name: field.name,
			language: field.language,
		});

		const onFinish = (values) => {
			log.debug("SuperfieldForm.onFinish, values:", values);
			field.create(values);
		};

		const onFinishFailed = (errorInfo) => {
			log.debug("SuperfieldForm.onFinishFailed, errorInfo:", errorInfo);
		};

		const onValuesChange = (changedValues, allValues) => {
			log.debug("SuperfieldForm.onValuesChange, changedValues:", changedValues);
			field.onValuesChange(changedValues, allValues);
		};

		const validateUniqueName = (rule, value) => {
			log.debug("SuperfieldForm.validateUniqueName, value:", value);
			if (!value || !field.table) {
				return Promise.resolve();
			}
			const existingField = field.table.getFieldByNameIfExists(value);
			if (existingField) {
				return Promise.reject(`The ${value} field already exists`);
			}
			return Promise.resolve();
		};

		return (
			<Form
				form={form}
				layout="vertical"
				onValuesChange={onValuesChange}
				onFinish={onFinish}
				onFinishFailed={onFinishFailed}
			>
				{/* <StyledFormItem
				label="Table to create the field in"
				rules={[{ required: true, message: "Please select a table" }]}
			> */}
				<TableSelector field={field} />
				<BoundInput
					name="name"
					rules={[
						{
							required: true,
							message: "Please enter a field name",
						},
						{
							validator: validateUniqueName,
						},
					]}
					label="Unique name for field"
					model={field}
					prop="name"
				/>
				{/* </StyledFormItem> */}
				<BoundSelect
					name="language"
					rules={[{ required: true, message: "Please select a language" }]}
					label="Language for field values"
					model={field}
					prop="language"
					options={languagePackStore.supportedLanguages}
				/>
				{children}
				<StyledFormItem label="Preview of field values">
					{field.options.length > 0 ? (
						<Select defaultValue={field.options[0].value}>
							{field.options.map((option) => (
								<Option key={option.value} value={option.value}>
									{option.name}
								</Option>
							))}
						</Select>
					) : (
						<Select placeholder="Loading values in selected language" />
					)}
				</StyledFormItem>
				<StyledFormItem
					validateStatus={field.submitStatus}
					help={field.submitStatusMessage}
				>
					<StyledSubmitButton
						id="submit"
						type="primary"
						htmlType="submit"
						loading={field.isCreating}
						justified="true"
					>
						Create field
					</StyledSubmitButton>
				</StyledFormItem>
			</Form>
		);
	}
);

export default SuperfieldForm;
